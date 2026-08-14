# Backlog de Implementação — SaaS de Aulas de Kung Fu

> Documento de trabalho: cada fase tem **tasks** (com critérios de aceite) e um **prompt pronto para colar** em um agente de código (Claude Code, Cursor, etc.).
> Substitua `{STACK}` no início de cada prompt pela sua stack real, ex.: *"Next.js 14 + Prisma + PostgreSQL + Tailwind + NextAuth"*.

---

## 1. Premissa central: trabalhar sobre o banco atual

Nenhuma task deste documento pede migration, tabela nova ou alteração de schema. Tudo é **tela, rota, consulta e regra de aplicação** em cima do que já existe.

Duas features da sua lista, porém, dependem de dois estados existirem persistidos em algum lugar:

| Feature | Estado necessário |
|---|---|
| "Mensagem para o aluno esperar aprovação" | Um status de conta do aluno (algo como pendente / ativo / rejeitado) |
| "Aluno vê quando o pagamento está pendente ou não aprovado" | Um status por pagamento ou por mensalidade |

Se esses campos **já existem** no seu banco (mesmo com outro nome, ou como boolean tipo `aprovado`), o documento inteiro roda sem tocar em nada. Se **não existem**, essas duas features específicas ficam bloqueadas até você decidir criá-los — e nesse caso vale marcá-las como Fase 5, deixando as outras oito andarem antes. As demais features (landing page, botão de voltar, responsividade, edição de perfil, lista de instrutores, minhas turmas, painel admin) não dependem de nada novo.

**Antes de começar, confirme o nome real dos campos** e substitua nos prompts abaixo. Onde eu escrevo `statusConta` e `statusPagamento`, use o que já está no seu schema.

---

## 2. Visão geral das fases

| Fase | Foco | Entrega | Depende de |
|---|---|---|---|
| **1** | Porta de entrada | Landing page + tela de espera pós-cadastro | — |
| **2** | Área do aluno | Turmas, pagamentos, perfil, instrutores | — |
| **3** | Painel administrativo | Aprovações e visão de quem pagou | — |
| **4** | UX transversal | Botão de voltar e responsividade | 1, 2, 3 |

As fases 1, 2 e 3 são independentes entre si — podem ser feitas em paralelo ou na ordem que fizer mais sentido para você. A Fase 4 vem por último de propósito: fazer botão de voltar e responsividade depois que as telas existem evita retrabalho. Mas os **padrões** (layout base, breakpoints) devem ser definidos já na Fase 1 e reutilizados nas seguintes.

---

## 3. FASE 1 — Porta de entrada

Hoje o sistema abre direto no login. Isso mata a conversão de aluno novo: quem chega pelo Instagram não sabe o que é a escola, quanto custa, onde fica, nem como falar com alguém.

### T1.1 — Landing page pública

**Objetivo:** primeira tela do domínio raiz (`/`), com o login movido para `/login`.

**Seções mínimas**
1. Hero: nome da escola, proposta de valor, CTA duplo (**Matricule-se** → cadastro | **Entrar** → login).
2. Sobre o kung fu / a escola — texto curto, foto.
3. Turmas e horários (turmas ativas, lidas do banco).
4. Instrutores (reaproveita o componente da T2.4).
5. **Contato: telefone clicável (`tel:`), WhatsApp (`wa.me` com mensagem pré-preenchida), Instagram, endereço + mapa.**
6. Rodapé com redes sociais.

**Critérios de aceite**
- [ ] Acessível sem autenticação.
- [ ] Telefone e WhatsApp funcionam com um toque no celular.
- [ ] Meta tags Open Graph + título/descrição para compartilhamento em rede social.
- [ ] Usuário já autenticado que acessa `/` é redirecionado para o painel dele.
- [ ] Lighthouse mobile ≥ 90 em performance e acessibilidade.

> Se os dados de contato (telefone, WhatsApp, Instagram, endereço) ainda não estão no banco, coloque-os num arquivo de configuração único (`config/escola.ts` ou variáveis de ambiente) — não espalhe hardcoded pelo JSX.

### T1.2 — Ajustes no fluxo de cadastro

**Critérios de aceite**
- [ ] Formulário coleta nome, email, telefone/WhatsApp, senha e turma de interesse (opcional, se o campo existir).
- [ ] Ao final do cadastro o usuário é levado direto para a tela de espera (T1.3), já autenticado.
- [ ] Notificação (email ou in-app) para o administrador de que há cadastro novo.
- [ ] Validação de email duplicado com mensagem clara.

### T1.3 — Tela de "aguardando aprovação"

**Objetivo:** o aluno recém-cadastrado precisa saber que deu tudo certo e o que acontece a seguir. Hoje ele fica preso sem entender por quê — é o pior problema de experiência da lista.

**Critérios de aceite**
- [ ] Após o cadastro, o usuário cai nesta tela.
- [ ] Se fizer logout e login de novo ainda não aprovado, cai nesta tela.
- [ ] Mensagem explica: cadastro recebido, aguardando aprovação do professor, prazo estimado.
- [ ] Botão de WhatsApp para falar com a escola.
- [ ] Nenhuma outra rota do app é acessível neste estado — bloqueio em middleware/guard, não apenas escondendo itens de menu.
- [ ] Conta rejeitada mostra mensagem distinta, com contato para recurso.

### 🟦 Prompt da Fase 1

```
Contexto: estou construindo um SaaS de gestão de aulas de kung fu em {STACK}.
IMPORTANTE: não altere o schema do banco. Não crie migrations, tabelas nem
colunas. Use apenas os campos que já existem — se precisar de algum campo que
não existe, pare e me avise em vez de criar.

Hoje o sistema abre direto na tela de login, o que é péssimo para aluno novo.
Implemente a porta de entrada pública.

1. LANDING PAGE em "/", pública, com: hero e CTA duplo (Matricule-se / Entrar);
   sobre a escola; turmas e horários lidos do banco (apenas turmas ativas);
   seção de instrutores; e uma seção de contato com telefone clicável (tel:),
   WhatsApp via wa.me com mensagem pré-preenchida, Instagram e endereço.
   Centralize os dados de contato num único arquivo de configuração, não
   espalhados pelo JSX. Mobile-first. Inclua meta tags Open Graph. Usuário já
   autenticado que acessar "/" deve ser redirecionado ao painel dele. Mova o
   login para "/login" e o cadastro para "/cadastro".

2. CADASTRO: ao concluir, leve o usuário já autenticado direto para a tela de
   espera descrita abaixo. Dispare notificação para os administradores
   informando que há cadastro novo. Trate email duplicado com mensagem clara.

3. TELA DE ESPERA em "/aguardando-aprovacao": exibida logo após o cadastro e
   sempre que um usuário ainda não aprovado fizer login. Deve explicar que o
   cadastro foi recebido e aguarda aprovação do professor, informar prazo
   estimado e oferecer botão de WhatsApp para contato. Bloqueie TODAS as demais
   rotas nesse estado via middleware/guard, não apenas escondendo itens de
   menu. Contas rejeitadas veem uma tela distinta, com orientação de contato.
   Use o campo de status de conta que já existe no banco — me diga qual você
   encontrou e usou.

Defina nesta fase o layout base e os breakpoints que serão reutilizados nas
telas seguintes, e me diga quais foram.
```

---

## 4. FASE 2 — Área do aluno

### T2.1 — Minhas turmas

**Critérios de aceite**
- [ ] Lista apenas as turmas em que o usuário logado está matriculado.
- [ ] Cada card: nome da turma, instrutor, dias/horários, local, status da matrícula.
- [ ] Estado vazio tratado: "Você ainda não está em nenhuma turma" + contato da escola.
- [ ] A consulta filtra pelo usuário da sessão no servidor — nunca aceita um ID de aluno vindo do cliente.

### T2.2 — Meus pagamentos

**Critérios de aceite**
- [ ] Lista por mês de referência, mais recente primeiro.
- [ ] Badge de status com **texto em linguagem natural**, não o nome técnico do campo:
  - "Aguardando pagamento" (cinza)
  - "Comprovante enviado — aguardando aprovação do professor" (amarelo)
  - "Pagamento confirmado" (verde)
  - "Comprovante não aprovado" (vermelho, com o motivo visível)
  - "Pagamento em atraso" (laranja)
- [ ] A diferença entre *"eu ainda não paguei"* e *"eu paguei e o professor ainda não aprovou"* precisa ser óbvia sem esforço de leitura.
- [ ] Alerta no topo do painel quando houver pendência ou atraso.
- [ ] Se já existir upload de comprovante, enviá-lo move o registro para o estado de análise.

### T2.3 — Editar meu perfil

**Critérios de aceite**
- [ ] O aluno edita: nome, telefone, foto, data de nascimento, contato de emergência, bio — **apenas os campos que já existem** no schema.
- [ ] O aluno **não** edita: status da conta, turmas, matrícula, status de pagamento.
- [ ] Alteração de email exige confirmação; alteração de senha exige a senha atual.
- [ ] Validação no servidor de que o usuário só altera o próprio registro, com teste explícito tentando editar outro usuário pelo ID (proteção contra IDOR).

### T2.4 — Diretório de instrutores

**Critérios de aceite**
- [ ] Lista os instrutores ativos, com foto, nome, graduação/faixa, bio curta e turmas que leciona.
- [ ] Não expõe email nem telefone pessoal do instrutor — o contato passa pelo canal da escola.
- [ ] Componente reutilizável entre a landing page (T1.1) e a área logada.
- [ ] Campos vazios degradam bem (sem foto → avatar com iniciais; sem bio → oculta a seção).

### 🟦 Prompt da Fase 2

```
Contexto: SaaS de aulas de kung fu em {STACK}.
IMPORTANTE: não altere o schema do banco. Não crie migrations, tabelas nem
colunas. Use apenas os campos existentes — se faltar algum, pare e me avise.

Implemente a área logada do aluno, reutilizando o layout base e os breakpoints
já definidos.

1. MINHAS TURMAS: lista as turmas em que o usuário logado está matriculado.
   Card com nome da turma, instrutor, dias e horários, local e status da
   matrícula. Estado vazio orientando a procurar a escola. A consulta deve
   filtrar pelo usuário da sessão no servidor, nunca por um ID vindo do cliente.

2. MEUS PAGAMENTOS: histórico por mês de referência, mais recente primeiro, com
   badge de status escrito em linguagem natural em vez do nome técnico do campo:
   - ainda não pago       → "Aguardando pagamento"
   - enviado/em análise   → "Comprovante enviado — aguardando aprovação do professor"
   - aprovado             → "Pagamento confirmado"
   - rejeitado            → "Comprovante não aprovado" + exibir o motivo
   - vencido              → "Pagamento em atraso"
   O aluno precisa distinguir sem esforço "eu ainda não paguei" de "eu paguei e
   o professor ainda não aprovou". Exiba um alerta no topo do painel quando
   houver pendência ou atraso. Me diga qual campo do banco você usou para
   derivar cada um desses estados.

3. MEU PERFIL: o aluno edita os próprios dados cadastrais que já existem no
   schema (nome, telefone, foto, etc.). Ele NÃO pode editar status da conta,
   matrículas nem status de pagamento. Troca de email exige confirmação; troca
   de senha exige a senha atual. Valide no servidor que o usuário só altera o
   próprio registro e escreva um teste que tenta explicitamente editar outro
   usuário passando o ID dele.

4. INSTRUTORES: diretório com foto, nome, graduação/faixa, bio curta e turmas
   que leciona. Não exponha email nem telefone pessoal. Trate campos vazios com
   fallback elegante. Faça o componente reutilizável para uso também na landing
   page.
```

---

## 5. FASE 3 — Painel administrativo

Você descreveu três recortes que o admin precisa ver de imediato. Trate cada um como um card clicável no topo do painel, que leva a uma lista filtrada.

### T3.1 — Dashboard com os recortes

**Cards do topo**
1. **Aguardando aprovação de cadastro** — contas ainda não aprovadas.
2. **Cadastrados e em dia** — alunos ativos com pagamento aprovado no mês selecionado.
3. **Cadastrados e não pagos** — alunos ativos sem pagamento aprovado no mês selecionado.
4. **Comprovantes aguardando aprovação** — pagamentos enviados e ainda não avaliados.

**Critérios de aceite**
- [ ] Cada card mostra a contagem e leva à lista filtrada correspondente.
- [ ] Seletor de mês afeta os cards financeiros (2, 3 e 4).
- [ ] As contagens batem com a consulta direta no banco (valide manualmente uma vez).
- [ ] Exportação em CSV da lista filtrada.
- [ ] Instrutor vê os cards restritos às próprias turmas; administrador vê a escola toda — validado no servidor.

### T3.2 — Fila de aprovação de cadastros

**Critérios de aceite**
- [ ] Lista com nome, email, telefone, turma de interesse e data do cadastro.
- [ ] Ação de aprovar (movendo a conta para ativa) e de rejeitar com motivo.
- [ ] Aprovação notifica o aluno.
- [ ] Ação em lote para múltiplas aprovações.
- [ ] A tela não deixa aprovar duas vezes o mesmo cadastro (estado desabilitado após a ação).

### T3.3 — Aprovação de pagamentos

**Critérios de aceite**
- [ ] Lista de pagamentos aguardando avaliação, com acesso ao comprovante.
- [ ] Aprovar confirma o pagamento; rejeitar exige motivo, que fica visível ao aluno na tela dele (T2.2).
- [ ] Instrutor só aprova pagamentos das próprias turmas — validado no servidor, não só na UI.
- [ ] O aluno é notificado do resultado.

### 🟦 Prompt da Fase 3

```
Contexto: SaaS de aulas de kung fu em {STACK}.
IMPORTANTE: não altere o schema do banco. Não crie migrations, tabelas nem
colunas. Use apenas os campos existentes — se faltar algum, pare e me avise.

Implemente o painel administrativo.

1. DASHBOARD com quatro cards no topo, cada um com contagem e link para a lista
   filtrada correspondente:
   a) Cadastros aguardando aprovação
   b) Alunos ativos em dia no mês selecionado (pagamento aprovado)
   c) Alunos ativos cadastrados que ainda NÃO pagaram no mês selecionado
   d) Comprovantes enviados aguardando aprovação
   Inclua um seletor de mês que afeta os cards b, c e d, e exportação em CSV de
   cada lista filtrada. Me mostre as queries usadas para cada contagem, para eu
   conferir manualmente que os números batem.

2. FILA DE APROVAÇÃO DE CADASTROS: nome, email, telefone, turma de interesse e
   data. Ações de aprovar e de rejeitar com motivo obrigatório. Suporte a ação
   em lote. Aprovar deve notificar o aluno. Impeça aprovação duplicada
   desabilitando a ação após executada.

3. APROVAÇÃO DE PAGAMENTOS: lista dos pagamentos aguardando avaliação, com
   acesso ao comprovante. Aprovar confirma; rejeitar exige motivo, que precisa
   ficar visível para o aluno na tela de pagamentos dele. Notifique o aluno do
   resultado.

Em todas as três telas, um instrutor deve enxergar apenas as próprias turmas e
o administrador enxerga a escola inteira. Valide isso no servidor, em cada
endpoint, e escreva testes que verifiquem que um instrutor não consegue
aprovar cadastro ou pagamento fora das próprias turmas.
```

---

## 6. FASE 4 — UX transversal

### T4.1 — Navegação e botão de voltar

O pedido é "botão de voltar em todas as seções". Um aviso: `history.back()` puro dá comportamento errado quando o usuário chega por link direto ou logo após um redirect — que é exatamente o caso do fluxo pós-cadastro. Use **voltar hierárquico**, não histórico do navegador.

**Critérios de aceite**
- [ ] Componente único `<PageHeader titulo backTo />` usado em todas as telas internas.
- [ ] O destino do voltar é o **pai hierárquico da rota**, não o histórico.
- [ ] Breadcrumb em telas de terceiro nível ou mais.
- [ ] Swipe-back nativo continua funcionando no iOS/Android.
- [ ] O botão não aparece nas telas raiz de cada área (dashboard, landing).
- [ ] Formulário com alterações não salvas pede confirmação antes de sair.

### T4.2 — Responsividade mobile

**Critérios de aceite**
- [ ] Auditoria completa em 360px, 390px, 414px, 768px e 1024px.
- [ ] Nenhum scroll horizontal em nenhuma tela.
- [ ] Alvos de toque ≥ 44×44px.
- [ ] Tabelas do painel admin viram cards empilhados abaixo de 768px.
- [ ] Navegação principal vira bottom tab bar ou drawer no mobile.
- [ ] Inputs com `inputmode` correto (telefone, email, numérico) e `font-size` ≥ 16px, para não disparar zoom automático no iOS.
- [ ] Modais viram bottom sheets no mobile.
- [ ] `safe-area-inset` respeitado em aparelhos com notch.
- [ ] Upload de comprovante funciona pela câmera do celular.

### 🟦 Prompt da Fase 4

```
Contexto: SaaS de aulas de kung fu em {STACK}. As telas já existem. Agora é
polimento transversal de navegação e mobile. Não altere o schema do banco.

1. NAVEGAÇÃO: crie um componente único <PageHeader titulo backTo /> e aplique-o
   em todas as telas internas. Importante: o botão de voltar deve navegar para
   o PAI HIERÁRQUICO da rota atual, e não usar history.back() — o usuário pode
   ter chegado por link direto ou por redirect após uma ação, e nesses casos o
   histórico do navegador leva ao lugar errado. Adicione breadcrumb em telas de
   terceiro nível ou mais profundas. Não exiba o botão nas telas raiz de cada
   área. Se houver formulário com alterações não salvas, peça confirmação antes
   de sair. Garanta que o swipe-back nativo do iOS/Android continue funcionando.

2. RESPONSIVIDADE: faça uma auditoria mobile de TODAS as telas em 360, 390, 414,
   768 e 1024px e corrija:
   - eliminar qualquer scroll horizontal
   - alvos de toque com no mínimo 44x44px
   - tabelas do painel admin viram cards empilhados abaixo de 768px
   - navegação principal vira bottom tab bar ou drawer no mobile
   - inputs com inputmode correto e font-size mínimo de 16px (evita zoom no iOS)
   - modais viram bottom sheets no mobile
   - respeitar safe-area-inset em aparelhos com notch
   - upload de comprovante deve permitir usar a câmera do celular
   Ao final, entregue a lista de telas auditadas com o que foi corrigido em cada.
```

---

## 7. Ordem de execução recomendada

```
Fase 1  ████████                  landing + tela de espera
Fase 2      ████████████          maior volume de tela
Fase 3              ████████      destrava a operação da escola
Fase 4                  ██████    polimento, atravessa tudo
```

Se precisar entregar valor rápido, o menor recorte útil é **T1.3 (tela de espera) + T3.2 (fila de aprovação)**. Sem esses dois, o aluno que se cadastra fica parado sem saber o que aconteceu e o professor não tem onde aprovar — é o gargalo mais caro da lista atual, e nenhum dos dois exige mexer no banco.

---

## 8. Checklist de QA por perfil

Rode antes de considerar qualquer fase concluída.

**Como visitante (deslogado)**
- [ ] Vejo a landing page e consigo ligar ou mandar WhatsApp em um toque.
- [ ] Não acesso nenhuma rota interna digitando a URL direto.

**Como aluno recém-cadastrado**
- [ ] Vejo a tela de espera e entendo o que fazer.
- [ ] Toda outra rota me redireciona de volta para lá.

**Como aluno aprovado**
- [ ] Vejo minhas turmas, e só as minhas.
- [ ] Distingo "não paguei" de "paguei e aguardo aprovação".
- [ ] Edito meu perfil, mas não meu status nem minhas matrículas.
- [ ] Tentar editar outro usuário trocando o ID na URL retorna 403.
- [ ] Vejo o botão de voltar em toda tela interna e ele leva ao lugar certo.

**Como instrutor**
- [ ] Vejo e aprovo apenas o que é das minhas turmas.
- [ ] Não consigo ver dados de turma alheia forçando a URL.

**Como admin**
- [ ] Os quatro cards batem com a contagem real do banco.
- [ ] Aprovo cadastros em lote e o aluno é notificado.

**No celular (360px)**
- [ ] Nenhuma tela tem scroll horizontal.
- [ ] Consigo enviar comprovante pela câmera.