<script>
  import {
    Button,
    Content,
    Header,
    LayoutDirection,
    SidePanel,
    TextInput,
  } from "carbon-components-svelte";

  let open = true;
</script>

<LayoutDirection dir="rtl">
  <Header companyName="IBM" platformName="Cloud" />
  <Content>
    <Button onclick={() => (open = true)}>تعديل الخدمة</Button>
  </Content>

  <SidePanel bind:open resizable currentStep={1} title="تعديل الخدمة">
    <TextInput labelText="اسم الخدمة" value="checkout-api" />
    <svelte:fragment slot="actions">
      <Button kind="secondary" onclick={() => (open = false)}>إلغاء</Button>
      <Button onclick={() => (open = false)}>حفظ</Button>
    </svelte:fragment>
  </SidePanel>
</LayoutDirection>
